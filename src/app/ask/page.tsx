
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { postQuestion } from "../actions";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long.").max(150, "Title cannot exceed 150 characters."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  tags: z.string().regex(/^([a-z0-9-]+\s*,\s*)*[a-z0-9-]+$/, "Tags must be comma-separated, lowercase words, e.g., 'react,nextjs,tailwind'"),
});

export default function AskQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to post a question.",
        });
        return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('tags', values.tags);
    formData.append('userId', user.uid);

    const result = await postQuestion(formData);

    if (result.success) {
      toast({
        title: "Question Posted!",
        description: "Your question has been successfully submitted.",
      });
      router.push("/questions");
    } else {
        toast({
            variant: "destructive",
            title: "Failed to post question",
            description: result.error,
        });
    }
  }

  if (isUserLoading || !user) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Ask a Public Question</CardTitle>
              <CardDescription>
                Get answers from the community. Be specific and imagine you’re asking a question to another person.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormDescription>
                      Be specific and imagine you’re asking a question to another person.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g. How to use Server Actions in Next.js 14?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed description</FormLabel>
                    <FormDescription>
                      Introduce the problem and expand on what you put in the title. Minimum 20 characters.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Include all the information someone would need to answer your question..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormDescription>
                      Add up to 5 tags to describe what your question is about. Use comma to separate tags.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g. nextjs,react,typescript" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Post Your Question
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
