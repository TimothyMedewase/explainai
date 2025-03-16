"use client";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function CardWithForm() {
  const [isGenerating, setIsGenerating] = React.useState(true);

  const words = `Lorem ipsum odor amet, consectetuer adipiscing elit. Metus cursus porttitor dictum, et orci leo. Mauris facilisis mauris arcu praesent; sit euismod non? Eu vulputate facilisis at facilisis finibus dolor magnis bibendum. Torquent nulla pharetra efficitur consequat vivamus arcu ex non. Euismod massa morbi vestibulum varius integer. Euismod ac vivamus vel lacus magna rhoncus hac metus egestas. Magna enim potenti convallis; suscipit metus consequat. Adipiscing cras libero ex cubilia augue iaculis varius. Cursus dui augue ante eget fringilla?

Lobortis morbi leo vitae vestibulum risus aliquam purus pharetra. Lobortis quam eu nisi sem ex scelerisque habitant potenti. Mus cubilia rhoncus per maximus magnis consequat. Quisque curae lacinia eleifend aenean porta commodo! Sed litora natoque habitant velit lacinia et cursus. Facilisis cubilia facilisi sapien nisi, efficitur mauris conubia. Senectus quam dapibus nascetur mollis volutpat; faucibus dictum nisi. Fermentum aenean nisi cras ante primis conubia libero. Aliquam nec vivamus bibendum scelerisque cras.

Quam hendrerit scelerisque praesent euismod ex etiam accumsan lacinia. Lobortis platea ad vehicula primis montes lacus est. Auctor aliquam dis fusce convallis mi in potenti. Vestibulum blandit risus elit semper metus parturient dui. Et hendrerit viverra sollicitudin; platea sagittis class. Et adipiscing consectetur justo molestie donec suspendisse morbi. Feugiat vestibulum natoque turpis curabitur elementum justo. Porta donec eu laoreet phasellus praesent purus, justo bibendum. Justo ultricies dui curae nam vulputate dui amet quis nisl.`;

  const handleComplete = () => {
    setIsGenerating(false);
  };

  return (
    <Card className="m-4 w-full max-w-md">
      <CardHeader>
        <CardTitle>Answer</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {isGenerating ? (
            <>
              Explaining <Spinner className="h-4 w-4" />
            </>
          ) : (
            "Explained!"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TextGenerateEffect words={words} onComplete={handleComplete} />
      </CardContent>
    </Card>
  );
}
