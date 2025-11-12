import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import OtUtilizationChart from '@/components/reports/ot-utilization-chart';
import SurgeriesByTypeChart from '@/components/reports/surgeries-by-type-chart';

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reporting & Analytics"
        description="Analyze OT activity, resource utilization, and efficiency."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OT Utilization</CardTitle>
            <CardDescription>Monthly utilization percentage for each operating theater.</CardDescription>
          </CardHeader>
          <CardContent>
            <OtUtilizationChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Surgeries by Type</CardTitle>
            <CardDescription>Distribution of surgeries across different specializations.</CardDescription>
          </CardHeader>
          <CardContent>
            <SurgeriesByTypeChart />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
