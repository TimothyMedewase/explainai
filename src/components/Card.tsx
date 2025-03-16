import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardWithForm() {
  return (
    <Card className="m-4 w-full max-w-md">
      <CardHeader>
        <CardTitle>Answer</CardTitle>
        <CardDescription>Explained!</CardDescription>
      </CardHeader>
      <CardContent>
        <div>Your answer</div>
      </CardContent>
    </Card>
  );
}
