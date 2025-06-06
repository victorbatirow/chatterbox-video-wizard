
import { Link } from "react-router-dom";
import { Video } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mx-auto mb-4 flex w-full flex-col justify-center rounded-[20px] border-2 border-gray-200 bg-background px-8 py-8 dark:border-gray-800 sm:flex-row mt-6">
      <nav className="grid w-full grid-cols-3 content-center justify-end gap-4 gap-y-12 text-base sm:gap-12 md:grid-cols-6">
        <div className="col-span-full mb-16 flex flex-col max-sm:items-center sm:col-span-1 sm:mb-0">
          <Link to="/" className="self-center sm:self-start">
            <Video className="size-8 text-purple-400" />
          </Link>
        </div>
        
        <div className="max-sm:text-center">
          <p className="mb-3 font-medium">Company</p>
          <ul className="space-y-3 font-normal text-muted-foreground">
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Blog</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Careers</a></li>
          </ul>
        </div>
        
        <div className="max-sm:text-center">
          <p className="mb-3 font-medium">Product</p>
          <ul className="space-y-3 font-normal text-muted-foreground">
            <li><a className="hover:underline" href="#">Import from Figma</a></li>
            <li><a className="hover:underline" href="#">Videos</a></li>
            <li><a className="hover:underline" href="#">Roadmap</a></li>
            <li><a className="hover:underline" href="#">Status</a></li>
            <li><a className="hover:underline" href="#">Changelog</a></li>
            <li><a className="hover:underline" href="#">Pricing</a></li>
            <li><a className="hover:underline" href="#">Solutions</a></li>
            <li><a className="hover:underline" href="#">Hire a Partner</a></li>
            <li><a className="hover:underline" href="#">Become a Partner</a></li>
          </ul>
        </div>
        
        <div className="max-sm:text-center">
          <p className="mb-3 font-medium">Resources</p>
          <ul className="space-y-3 font-normal text-muted-foreground">
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Launched</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Enterprise</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Learn</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Support</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Integrations</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Affiliates</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Brand Guidelines</a></li>
          </ul>
        </div>
        
        <div className="max-sm:text-center">
          <p className="mb-3 font-medium">Legal</p>
          <ul className="space-y-3 font-normal text-muted-foreground">
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Privacy Policy</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Terms & Conditions</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Report Abuse</a></li>
            <li><a className="flex items-center gap-1 hover:underline max-sm:justify-center" href="#">Report Security Concerns</a></li>
          </ul>
        </div>
        
        <div className="max-sm:text-center">
          <p className="mb-3 font-medium">Socials</p>
          <ul className="space-y-3 font-normal text-muted-foreground">
            <li><a href="#" target="_blank" title="Follow on X" className="hover:underline">X / Twitter</a></li>
            <li><a href="#" target="_blank" title="Follow on LinkedIn" className="hover:underline">LinkedIn</a></li>
            <li><a href="#" target="_blank" title="Join the Discord server" className="hover:underline">Discord</a></li>
            <li><a href="#" target="_blank" title="Join Lovable on Reddit" className="hover:underline">Reddit</a></li>
          </ul>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
