import React, { useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpDown, TrendingDown, Users, Clock, Target } from 'lucide-react';

import { 
  Application, 
  DashboardStats, 
  StatusCount, 
  ApplicationStatus,
  StatsCardProps,
  HighlightCardProps,
  StatusPieChartProps,
  ApplicationTableProps
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface HomeProps {
  applications: Application[];
  error?: string;
}

// Color mapping for different statuses
const STATUS_COLORS = {
  Applied: '#3b82f6',     // Blue
  Screening: '#f59e0b',   // Amber
  Interviewing: '#8b5cf6', // Purple
  Offer: '#10b981',       // Green
  Rejected: '#ef4444',    // Red
  Ghosted: '#6b7280',     // Gray
} as const;

// Badge variant mapping for different statuses
const getBadgeVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'Offer':
      return 'success';
    case 'Rejected':
      return 'destructive';
    case 'Interviewing':
      return 'info';
    case 'Screening':
      return 'warning';
    case 'Ghosted':
      return 'secondary';
    default:
      return 'default';
  }
};

// Format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// Calculate days since last update to determine if ghosted
const calculateDaysSinceUpdate = (lastUpdate: string): number => {
  if (!lastUpdate) return 0;
  const today = new Date();
  const updateDate = new Date(lastUpdate);
  const diffTime = Math.abs(today.getTime() - updateDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = React.memo(({ title, value, icon, description }) => (
  <Card className="transition-all hover:shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
));

// Highlight Card Component for "Wall of Rejection"
const HighlightCard: React.FC<HighlightCardProps> = React.memo(({ application }) => (
  <Card className="border-l-4 border-l-primary bg-card/50">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{application.company}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{application.position}</p>
        </div>
        <Badge variant={getBadgeVariant(application.status)}>
          {application.status}
        </Badge>
      </div>
    </CardHeader>
    {application.notes && (
      <CardContent className="pt-0">
        <p className="text-sm italic">"{application.notes}"</p>
      </CardContent>
    )}
  </Card>
));

// Status Pie Chart Component
const StatusPieChart: React.FC<StatusPieChartProps> = React.memo(({ data }) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }} role="img" aria-label="Application status distribution pie chart">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [`${value} applications`, name]}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

// Application Table Component
const ApplicationTable: React.FC<ApplicationTableProps> = React.memo(({ applications }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columnHelper = createColumnHelper<Application>();

  const columns = [
    columnHelper.accessor('company', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label={`Sort by company ${column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
        >
          <span>Company</span>
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
      cell: (info) => (
        <div className="font-medium">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('position', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label={`Sort by position ${column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
        >
          <span>Position</span>
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    }),
    columnHelper.accessor('dateApplied', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label={`Sort by application date ${column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
        >
          <span>Applied</span>
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={getBadgeVariant(info.getValue())}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('lastUpdate', {
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-primary transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label={`Sort by last update date ${column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
        >
          <span>Last Update</span>
          <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: (info) => (
        <div className="max-w-xs sm:max-w-sm truncate text-muted-foreground">
          {info.getValue() || 'N/A'}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: applications,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Applications</CardTitle>
        <p className="text-sm text-muted-foreground">
          Click column headers to sort. Showing {applications.length} applications.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

// Main Dashboard Component
export default function Dashboard({ applications, error }: HomeProps) {
  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const total = applications.length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    const offers = applications.filter(app => app.status === 'Offer').length;
    
    // Count applications that haven't been updated in 30+ days and aren't in final states
    const ghosted = applications.filter(app => {
      const daysSinceUpdate = calculateDaysSinceUpdate(app.lastUpdate);
      const isInProgress = !['Rejected', 'Offer'].includes(app.status);
      return daysSinceUpdate > 30 && isInProgress;
    }).length;

    const successRate = total > 0 ? ((offers / total) * 100) : 0;

    return {
      totalApplications: total,
      totalRejections: rejected,
      ghostedCount: ghosted,
      successRate: parseFloat(successRate.toFixed(1)),
    };
  }, [applications]);

  // Prepare pie chart data
  const pieChartData: StatusCount[] = useMemo(() => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status as ApplicationStatus,
      count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#64748b',
    }));
  }, [applications]);

  // Get highlighted applications
  const highlightedApps = applications.filter(app => app.highlight);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard of Failures - Job Application Tracker</title>
        <meta 
          name="description" 
          content="A transparent look at the job hunt journey - tracking applications, rejections, and the occasional success."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Dashboard of <span className="text-primary">Failures</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A brutally honest look at the job hunt grind. Every rejection, every ghosting, 
              every small victory - transparently displayed for motivation and solidarity.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Applications"
              value={stats.totalApplications}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              description="Applications submitted"
            />
            <StatsCard
              title="Rejections"
              value={stats.totalRejections}
              icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
              description="The learning opportunities"
            />
            <StatsCard
              title="Ghosted"
              value={stats.ghostedCount}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              description="No response >30 days"
            />
            <StatsCard
              title="Success Rate"
              value={`${stats.successRate}%`}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
              description="Offers received"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications Table */}
            <div className="lg:col-span-2">
              <ApplicationTable applications={applications} />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Pie Chart */}
              <StatusPieChart data={pieChartData} />

              {/* Wall of Rejection */}
              {highlightedApps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wall of Notable Applications</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      The ones worth remembering
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {highlightedApps.map((app) => (
                      <HighlightCard key={`${app.company}-${app.position}-${app.dateApplied}`} application={app} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Motivational Card */}
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <blockquote className="text-sm italic text-center">
                    "Every rejection is a redirection to something better. 
                    Keep going - your breakthrough is just one application away."
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>
              Built with Next.js, TypeScript, and a lot of determination. 
              Data refreshes every 10 minutes.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    // For build-time generation, fall back to empty data if no URL available
    // This prevents build failures when environment variables aren't available
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
      console.warn('No base URL available during build, returning empty applications array');
      return {
        props: {
          applications: [],
          error: 'No data available during build. Please configure environment variables.',
        },
        revalidate: 60,
      };
    }

    // For development and deployed versions
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXTAUTH_URL || 'https://localhost:3000'
      : 'http://localhost:3000';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${baseUrl}/api/get-applications`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Dashboard-Internal-Request',
      },
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return {
        props: {
          applications: [],
          error: data.error,
        },
        revalidate: 600, // Revalidate every 10 minutes
      };
    }

    return {
      props: {
        applications: data.applications || [],
      },
      revalidate: 600, // Revalidate every 10 minutes
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
    let errorMessage = 'Unable to load application data. Please check your configuration.';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - please try again later.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - server may be down.';
      }
    }
    
    return {
      props: {
        applications: [],
        error: errorMessage,
      },
      revalidate: 60, // Retry more frequently when there's an error
    };
  }
};