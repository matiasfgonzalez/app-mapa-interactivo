"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  GraduationCap,
  MapPin,
  TrendingUp,
  Loader2,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsData {
  totalStudents: number;
  byFacultad: { name: string; value: number }[];
  byCarrera: { name: string; value: number; facultad: string }[];
  byLocalidad: { name: string; value: number }[];
  recentRegistrations: { date: string; count: number }[];
  topLocalidades: { name: string; value: number }[];
}

// Colores para los gráficos
const FALLBACK_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

interface StatsPanelProps {
  compact?: boolean;
  showTitle?: boolean;
}

export function StatsPanel({
  compact = false,
  showTitle = true,
}: Readonly<StatsPanelProps>) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || "Error al cargar estadísticas");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">
          Cargando estadísticas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats || stats.totalStudents === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay datos disponibles aún
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Los estudiantes deben registrar sus ubicaciones
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Estadísticas
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStats}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2"}`}>
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Estudiantes"
          value={stats.totalStudents}
          color="primary"
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Facultades"
          value={stats.byFacultad.length}
          color="success"
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Localidades"
          value={stats.byLocalidad.length}
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Carreras"
          value={stats.byCarrera.length}
          color="info"
        />
      </div>

      {/* Gráfico de líneas - Registros recientes */}
      {stats.recentRegistrations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Registros últimos 7 días
          </h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.recentRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Registros"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de barras - Por facultad */}
      {stats.byFacultad.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Estudiantes por Facultad
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byFacultad.slice(0, 5)}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={100}
                  tickFormatter={(value) =>
                    value.length > 15 ? `${value.slice(0, 15)}...` : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  name="Estudiantes"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico circular - Top localidades */}
      {stats.topLocalidades.length > 0 && !compact && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Top 5 Localidades
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topLocalidades}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) =>
                    `${name?.slice(0, 10) ?? ""}${(name?.length ?? 0) > 10 ? "..." : ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {stats.topLocalidades.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lista de top carreras */}
      {stats.byCarrera.length > 0 && !compact && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Top Carreras</h4>
          <div className="space-y-1.5">
            {stats.byCarrera.slice(0, 5).map((carrera, index) => (
              <div
                key={carrera.name}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground truncate">
                    {carrera.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {carrera.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de estadística
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "success" | "warning" | "info";
}

function StatCard({ icon, label, value, color }: Readonly<StatCardProps>) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="p-3 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Versión mini para el sidebar
export function StatsMini() {
  const [stats, setStats] = useState<{
    total: number;
    facultades: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const result = await response.json();
        if (result.success && result.data) {
          setStats({
            total: result.data.totalStudents,
            facultades: result.data.byFacultad.length,
          });
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {stats.total} estudiantes
      </span>
      <span className="flex items-center gap-1">
        <GraduationCap className="h-3.5 w-3.5" />
        {stats.facultades} facultades
      </span>
    </div>
  );
}
