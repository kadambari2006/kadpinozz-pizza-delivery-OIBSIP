import { FaLeaf } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-emerald-950 py-8">
      <div className="container mx-auto px-6 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-white font-extrabold text-lg tracking-wide">
          <FaLeaf className="text-emerald-400" />
          <span>KaDpinozz</span>
          <FaLeaf className="text-emerald-400" />
        </div>
        <p className="text-emerald-100 text-sm font-medium">
          Healthy Pizza &amp; Artisanal Snacks — Made with Wholesome Goodness
        </p>
        <p className="text-emerald-200 text-xs">
          &copy; {new Date().getFullYear()} KaDpinozz. All rights reserved. &nbsp;|&nbsp; Built with ♥ for healthy eaters.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
