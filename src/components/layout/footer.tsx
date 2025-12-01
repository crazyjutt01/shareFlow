import { Logo } from "../logo";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2">
                <Logo />
            </div>
          <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
            © {new Date().getFullYear()} ShareFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
