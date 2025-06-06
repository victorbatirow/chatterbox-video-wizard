
import { Link } from "react-router-dom";
import { Video } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-black/60 to-transparent py-16 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <Video className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Pamba</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Import from Figma</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Videos</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Solutions</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Hire a Partner</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Become a Partner</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Launched</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Enterprise</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Learn</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Affiliates</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Brand Guidelines</a></li>
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-12 md:gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Report Abuse</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Report Security Concerns</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Socials</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">X / Twitter</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Reddit</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
