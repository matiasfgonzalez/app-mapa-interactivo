"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    nombre: string;
    votos: { partido: string; porcentaje: number }[];
  };
};

export default function Resultados({ data }: Readonly<Props>) {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{data.nombre}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.votos}>
          <XAxis dataKey="partido" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="porcentaje" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
