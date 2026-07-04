import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

interface DailyRevenueChartProps {
    data: { date: string; revenue: number }[];
}

const currencyFmt = new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
});

const compactFmt = new Intl.NumberFormat("en-UG", {
    notation: "compact",
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 1,
});

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}) {
    if (!(active && payload?.length)) {
        return null;
    }
    return (
        <div className="rounded-lg border bg-background p-3 text-sm shadow-sm">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">
                {currencyFmt.format(payload[0].value)}
            </p>
        </div>
    );
}

export default function DailyRevenueChart({ data }: DailyRevenueChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily revenue — last 30 days</CardTitle>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer height={240} width="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                x2="0"
                                y1="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="hsl(var(--border))"
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            // Only show every 5th tick to avoid crowding
                            interval={4}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v: string) => {
                                const d = new Date(v);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                        />

                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v: number) => compactFmt.format(v)}
                            width={64}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        
                        <Area
                            dataKey="revenue"
                            fill="url(#revenueGradient)"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            type="monotone"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
