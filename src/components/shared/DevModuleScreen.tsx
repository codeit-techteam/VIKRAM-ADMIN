import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

interface DevModuleScreenProps {
  title: string;
  subtitle: string;
  features: string[];
}

export function DevModuleScreen({
  title,
  subtitle,
  features,
}: DevModuleScreenProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            Super Admin · Development
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature} className="shadow-card border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#1A1A1A]">
                {feature}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Module scaffold ready for Super Admin development.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
