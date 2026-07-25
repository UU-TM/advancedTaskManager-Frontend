"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/**
 * Component showcase
 * ----------------------------------------------------
 * Renders every shared primitive so designers and
 * engineers can verify the Alucard ↔ Dracula tokens
 * in one place. Reachable at `/dev/components`.
 */
export default function ComponentsShowcasePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progress, setProgress] = useState(64);
  const [checkbox, setCheckbox] = useState(true);
  const [toggle, setToggle] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Component Showcase
          </h1>
          <p className="text-sm text-muted-foreground">
            Every shared primitive in both Alucard (light) and Dracula (dark)
            themes. Use the toggle in the header to switch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Buttons */}
          <SectionCard
            title="Buttons"
            description="Variants map to primary (red/purple), secondary (purple/pink), and outline."
          >
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
              <Button>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading
              </Button>
            </div>
          </SectionCard>

          {/* Inputs */}
          <SectionCard
            title="Inputs"
            description="Text field, label, helper text, error state, and inline icon."
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disabled">Disabled input</Label>
                <Input id="disabled" value="Cannot edit" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="error">With error</Label>
                <Input
                  id="error"
                  aria-invalid
                  defaultValue="bad-input"
                  className="border-destructive focus-visible:ring-destructive"
                />
                <p className="text-xs text-destructive">
                  This field contains invalid characters.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Badges */}
          <SectionCard
            title="Badges & Tags"
            description="Use the `info` and `success` semantic tokens for status pills."
          >
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-success-foreground hover:bg-success">
                <CheckCircle2 className="mr-1 size-3" />
                Done
              </Badge>
              <Badge className="bg-info text-info-foreground hover:bg-info">
                <Info className="mr-1 size-3" />
                Info
              </Badge>
              <Badge className="bg-primary text-primary-foreground">
                Primary
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                Secondary
              </Badge>
            </div>
          </SectionCard>

          {/* Avatar */}
          <SectionCard
            title="Avatars"
            description="Fallback initials kick in when no image is provided."
          >
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage src="https://i.pravatar.cc/96?img=1" alt="Ada" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <Avatar className="size-12 border-2 border-primary">
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback>+</AvatarFallback>
              </Avatar>
            </div>
          </SectionCard>

          {/* Progress + Skeleton */}
          <SectionCard
            title="Progress & Skeleton"
            description="Loading primitives for async states."
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Upload progress</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </SectionCard>

          {/* Alerts */}
          <SectionCard
            title="Alerts"
            description="Inline feedback banners for info, success, and error states."
          >
            <Alert>
              <Info className="size-4" />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                You can swap themes via the toggle in the header — no page reload.
              </AlertDescription>
            </Alert>
            <Alert className="border-success/40 bg-success/10 text-success">
              <CheckCircle2 className="size-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your workspace was created successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                The backend is unreachable. Retrying in 5s.
              </AlertDescription>
            </Alert>
          </SectionCard>

          {/* Dialog */}
          <SectionCard
            title="Dialog"
            description="Modal overlay with header, body, and footer actions."
          >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete board?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All cards in this board will be
                    permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-md border p-3 text-sm">
                  <span className="text-muted-foreground">Board: </span>
                  <span className="font-medium">Sprint 24 — Planning</span>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => setDialogOpen(false)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SectionCard>

          {/* Form controls */}
          <SectionCard
            title="Form controls"
            description="Switch, checkbox, and label pairing."
          >
            <div className="flex items-center gap-3">
              <Switch
                id="airplane"
                checked={toggle}
                onCheckedChange={setToggle}
              />
              <Label htmlFor="airplane">Airplane mode</Label>
              <span className="ml-auto text-xs text-muted-foreground">
                {toggle ? "On" : "Off"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={checkbox}
                onCheckedChange={(v) => setCheckbox(Boolean(v))}
              />
              <Label htmlFor="terms">I accept the terms of service</Label>
            </div>
          </SectionCard>

          {/* Tabs */}
          <SectionCard
            title="Tabs"
            description="Useful for board settings panels and detail views."
          >
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="labels">Labels</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-3 text-sm">
                <p className="text-muted-foreground">
                  Board summary, owner, and column counts will appear here.
                </p>
              </TabsContent>
              <TabsContent value="members" className="mt-3 text-sm">
                <p className="text-muted-foreground">
                  Manage workspace members and their roles.
                </p>
              </TabsContent>
              <TabsContent value="labels" className="mt-3 text-sm">
                <p className="text-muted-foreground">
                  Create and rename the labels available on this board.
                </p>
              </TabsContent>
            </Tabs>
          </SectionCard>

          {/* Card composition */}
          <SectionCard
            title="Card composition"
            description="A realistic board card assembled from primitives."
          >
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      Sprint 24 — Planning
                    </CardTitle>
                    <CardDescription>
                      3 columns · 18 cards · 4 members
                    </CardDescription>
                  </div>
                  <Badge className="bg-success text-success-foreground hover:bg-success">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={64} />
                <div className="flex -space-x-2">
                  {["AD", "JS", "MK", "LP"].map((i) => (
                    <Avatar
                      key={i}
                      className="size-7 border-2 border-background"
                    >
                      <AvatarFallback className="text-xs">{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Open board</Button>
                <Button size="sm" variant="outline">
                  Share
                </Button>
              </CardFooter>
            </Card>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
