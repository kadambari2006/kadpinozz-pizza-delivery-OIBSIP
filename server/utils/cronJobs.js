const cron = require('node-cron');
const { Base, Sauce, Cheese, Veggie } = require('../schemas/inventorySchema');
const Admin = require('../schemas/adminUserSchema');
const sendEmail = require('../middlewares/nodemailerMiddleware');

// Cache to prevent email spam for identical low-stock states within a short cooldown window
let lastAlertedItemsKey = '';
let lastAlertTimestamp = 0;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown unless stock changes

/**
 * Checks all inventory categories for items below threshold (or default 20 units)
 * and sends an automated email notification to the Admin.
 */
const checkLowStockAndAlert = async (force = false) => {
  try {
    const [bases, sauces, cheeses, veggies] = await Promise.all([
      Base.find({}),
      Sauce.find({}),
      Cheese.find({}),
      Veggie.find({}),
    ]);

    const lowStockItems = [];

    const inspectCategory = (items, categoryName) => {
      for (const item of items) {
        const threshold = typeof item.threshold === 'number' ? item.threshold : 20;
        if (item.quantity <= threshold) {
          lowStockItems.push({
            category: categoryName,
            name: item.item,
            quantity: item.quantity,
            threshold,
          });
        }
      }
    };

    inspectCategory(bases, 'Pizza Base');
    inspectCategory(sauces, 'Sauce');
    inspectCategory(cheeses, 'Cheese');
    inspectCategory(veggies, 'Vegetable');

    if (lowStockItems.length === 0) {
      return { alerted: false, count: 0 };
    }

    // Generate unique key for current low stock snapshot
    const currentSnapshotKey = lowStockItems
      .map((i) => `${i.name}:${i.quantity}`)
      .sort()
      .join('|');

    const now = Date.now();
    if (
      !force &&
      currentSnapshotKey === lastAlertedItemsKey &&
      now - lastAlertTimestamp < ALERT_COOLDOWN_MS
    ) {
      console.log(
        `[node-cron] Low stock alert already sent recently for ${lowStockItems.length} items. Skipping duplicate email.`
          .yellow
      );
      return { alerted: false, count: lowStockItems.length, throttled: true };
    }

    // Determine Admin notification email
    const firstAdmin = await Admin.findOne({});
    const adminEmail =
      process.env.ADMIN_ALERT_EMAIL ||
      (firstAdmin && firstAdmin.email) ||
      'admin1@pizzapalette.com';

    console.log(
      `[node-cron ⚠️] ${lowStockItems.length} inventory item(s) below threshold! Sending alert to ${adminEmail}...`
        .red.bold
    );

    const rowsHtml = lowStockItems
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #d1fae5;">
          <td style="padding: 10px; font-weight: 600; color: #064e3b;">${item.category}</td>
          <td style="padding: 10px; color: #1f2937;">${item.name}</td>
          <td style="padding: 10px; text-align: center; font-weight: bold; color: ${
            item.quantity === 0 ? '#b91c1c' : '#d97706'
          };">${item.quantity} units</td>
          <td style="padding: 10px; text-align: center; color: #4b5563;">&le; ${item.threshold} units</td>
        </tr>
      `
      )
      .join('');

    const messageHtml = `
      <p style="font-size: 1rem; color: #1f2937;">
        The automated inventory monitoring scheduled job (<strong>node-cron</strong>) has detected that the following ingredients have fallen below their configured safety thresholds:
      </p>

      <div style="overflow-x: auto; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #d1fae5;">
          <thead>
            <tr style="background: #ecfdf5; color: #047857; text-align: left; font-size: 0.9rem;">
              <th style="padding: 10px;">Category</th>
              <th style="padding: 10px;">Item</th>
              <th style="padding: 10px; text-align: center;">Current Stock</th>
              <th style="padding: 10px; text-align: center;">Threshold</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <p style="font-size: 0.9rem; color: #4b5563;">
        Please log into the Admin Dashboard and manually update the stock quantities to avoid order processing disruptions.
      </p>
    `;

    const emailSent = await sendEmail({
      to: adminEmail,
      subject: `🚨 [KaDpinozz Alert] Low Inventory Notification (${lowStockItems.length} items below threshold)`,
      templateOptions: {
        title: 'Low Inventory Alert ⚠️',
        greeting: 'Hello Admin,',
        message: messageHtml,
        actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`,
        actionText: 'Restock in Admin Panel',
      },
    });

    if (emailSent) {
      lastAlertedItemsKey = currentSnapshotKey;
      lastAlertTimestamp = now;
      console.log(
        `[node-cron ✅] Low stock notification email delivered to ${adminEmail}!`
          .green.bold
      );
      return { alerted: true, count: lowStockItems.length };
    }

    return { alerted: false, count: lowStockItems.length };
  } catch (error) {
    console.error('[node-cron Error] Failed to execute low stock check:', error.message);
    return { error: error.message };
  }
};

/**
 * Initializes the node-cron scheduled job.
 * Default schedule: Every 15 minutes (or configurable via STOCK_ALERT_CRON env).
 */
const initInventoryCronJob = () => {
  // Cron schedule: every 15 minutes by default ("*/15 * * * *")
  const cronSchedule = process.env.STOCK_ALERT_CRON || '*/15 * * * *';

  console.log(`[node-cron] Scheduled Inventory Stock Monitor initialized (${cronSchedule})`.cyan);

  const job = cron.schedule(cronSchedule, async () => {
    console.log('[node-cron] Running scheduled inventory low-stock threshold sweep...'.cyan);
    await checkLowStockAndAlert(false);
  });

  // Run an initial check 10 seconds after server startup
  setTimeout(() => {
    checkLowStockAndAlert(false);
  }, 10000);

  return job;
};

module.exports = {
  initInventoryCronJob,
  checkLowStockAndAlert,
};
