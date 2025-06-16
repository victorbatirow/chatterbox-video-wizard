
import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import Container from "./Container";

const Footer = () => {
  return (
    <div className="relative z-10 w-full mt-12 pb-8">
      <Container>
        <footer className="mx-auto flex w-full flex-col justify-center rounded-[20px] border border-gray-200/20 bg-white/5 backdrop-blur-sm px-8 py-8 dark:border-gray-800/20 sm:flex-row">
          <nav className="grid w-full grid-cols-3 content-center justify-end gap-4 gap-y-12 text-base sm:gap-12 md:grid-cols-6">
            <div className="col-span-full mb-16 flex flex-col max-sm:items-center sm:col-span-1 sm:mb-0">
              <Link to="/" className="self-center sm:self-start">
                <Video className="size-8 text-purple-400" />
              </Link>
            </div>
            
            <div className="max-sm:text-center">
              <p className="mb-3 font-medium text-white">Company</p>
              <ul className="space-y-3 font-normal text-white/60">
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Blog</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Careers</a></li>
              </ul>
            </div>
            
            <div className="max-sm:text-center">
              <p className="mb-3 font-medium text-white">Product</p>
              <ul className="space-y-3 font-normal text-white/60">
                <li><a className="hover:underline hover:text-white/80" href="#">Videos</a></li>
                <li><a className="hover:underline hover:text-white/80" href="#">Roadmap</a></li>
                <li><a className="hover:underline hover:text-white/80" href="#">Status</a></li>
                <li><a className="hover:underline hover:text-white/80" href="#">Pricing</a></li>
              </ul>
            </div>
            
            <div className="max-sm:text-center">
              <p className="mb-3 font-medium text-white">Resources</p>
              <ul className="space-y-3 font-normal text-white/60">
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Enterprise</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Learn</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Support</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Brand Guidelines</a></li>
              </ul>
            </div>
            
            <div className="max-sm:text-center">
              <p className="mb-3 font-medium text-white">Legal</p>
              <ul className="space-y-3 font-normal text-white/60">
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Privacy Policy</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Terms & Conditions</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Report Abuse</a></li>
                <li><a className="flex items-center gap-1 hover:underline hover:text-white/80 max-sm:justify-center" href="#">Report Security Concerns</a></li>
              </ul>
            </div>
            
            <div className="max-sm:text-center">
              <p className="mb-3 font-medium text-white">Socials</p>
              <ul className="space-y-3 font-normal text-white/60">
                <li><a href="#" target="_blank" title="Follow on X" className="hover:underline hover:text-white/80">X / Twitter</a></li>
                <li><a href="#" target="_blank" title="Follow on LinkedIn" className="hover:underline hover:text-white/80">LinkedIn</a></li>
                <li><a href="#" target="_blank" title="Join the Discord server" className="hover:underline hover:text-white/80">Discord</a></li>
                <li><a href="#" target="_blank" title="Join Lovable on Reddit" className="hover:underline hover:text-white/80">Reddit</a></li>
              </ul>
            </div>
          </nav>
        </footer>
      </Container>
    </div>
  );
};

export default Footer;
