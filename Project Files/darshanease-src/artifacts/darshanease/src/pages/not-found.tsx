import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <PageTransition className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
      <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <span className="font-display text-4xl font-bold">ॐ</span>
      </div>
      <h1 className="text-4xl font-display font-bold text-foreground mb-4">Path Not Found</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The spiritual destination you are seeking cannot be found. Let us guide you back to the main path.
      </p>
      <Link href="/">
        <Button size="lg" className="px-8 font-semibold">
          Return Home
        </Button>
      </Link>
    </PageTransition>
  );
}
