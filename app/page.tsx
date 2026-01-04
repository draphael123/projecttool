import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">CSV Report Combiner</h1>
      <p className="text-muted-foreground mb-8">
        Combine multiple CSV files into a single report based on a template
      </p>
      <Link href="/builder">
        <Button size="lg">Go to Builder</Button>
      </Link>
    </div>
  );
}

