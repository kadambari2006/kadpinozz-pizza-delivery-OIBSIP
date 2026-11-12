function emailBaseTemplate({
  title = '',
  greeting = '',
  message = '',
  actionText = '',
  actionUrl = '',
  closing = 'With wholesome health & taste',
  signature = 'Team KaDpinozz',
  extra = '',
}) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        outline: none;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .email-container {
          padding: 1rem !important;
        }
        .main-content {
          padding: 1.5rem !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; width: 100%; background-color: #ecfdf5;">
    
    <div class="email-container" style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #ecfdf5; padding: 2rem; color: #1e293b; line-height: 1.6; min-height: 100vh;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto;">
        <tr>
          <td>
            <div style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(5, 150, 105, 0.1); overflow: hidden; border: 1px solid #d1fae5;">
              
              <!-- Header -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 2.5rem 2rem; text-align: center;">
                    <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 1.8rem; font-weight: 800; border-radius: 9999px; padding: 0.5rem 1.8rem; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); margin-bottom: 0.75rem;">
                      🌱 KaDpinozz
                    </div>
                    <div style="color: #d1fae5; font-size: 0.9rem; font-weight: 500; letter-spacing: 0.5px;">
                      Healthy Pizza &amp; Wholesome Snacks
                    </div>
                    ${
                      title
                        ? `<h1 style="margin: 1.2rem 0 0 0; color: #ffffff; font-size: 1.6rem; font-weight: 700; letter-spacing: 0.3px;">${title}</h1>`
                        : ''
                    }
                  </td>
                </tr>
              </table>
              
              <!-- Content -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="main-content" style="padding: 2.5rem 2.5rem 2rem 2.5rem; background-color: #ffffff;">
                    ${
                      greeting
                        ? `<p style="font-size: 1.15rem; margin: 0 0 1.25rem 0; font-weight: 700; color: #064e3b;">${greeting}</p>`
                        : ''
                    }
                    ${
                      message
                        ? `<div style="margin: 0 0 1.75rem 0; font-size: 1.02rem; color: #334155; line-height: 1.7;">${message}</div>`
                        : ''
                    }
                    ${
                      actionText && actionUrl
                        ? `
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 2rem auto;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 0.9rem 2.2rem; border-radius: 9999px; font-weight: 700; font-size: 1rem; box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35); text-align: center;">${actionText}</a>
                          </td>
                        </tr>
                      </table>
                    `
                        : ''
                    }
                    ${extra ? `<div style="margin: 1.5rem 0;">${extra}</div>` : ''}
                    
                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 0.95rem;">
                        ${closing},<br>
                        <strong style="color: #059669; font-size: 1.05rem; display: inline-block; margin-top: 0.3rem;">${signature}</strong>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
            </div>
            
            <!-- Footer -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="text-align: center; padding: 1.8rem 1rem; color: #64748b; font-size: 0.85rem;">
                  <p style="margin: 0 0 0.3rem 0;">&copy; ${new Date().getFullYear()} KaDpinozz. Fresh, Organic, Guilt-Free.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;
}

module.exports = emailBaseTemplate;
