import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const data = [
  {
    name: 'Monday',
    uv: 400,
    pv: 240,
    amt: 2400,
  },
  {
    name: 'Tuesday',
    uv: 300,
    pv: 456,
    amt: 2400,
  },
  {
    name: 'Wednesday',
    uv: 300,
    pv: 139,
    amt: 2400,
  },
  {
    name: 'Thursday',
    uv: 200,
    pv: 980,
    amt: 2400,
  },
  {
    name: 'Friday',
    uv: 278,
    pv: 390,
    amt: 2400,
  },
  {
    name: 'Saturday',
    uv: 189,
    pv: 480,
    amt: 2400,
  },
];

export function ActivityChart() {
  return (
    <>
      <LineChart
        style={{ width: '100%', aspectRatio: 1.618, maxWidth: 800, margin: 'auto' }}
        responsive
        data={data}
      >
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis width="auto" />
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
      </LineChart>
    </>
  );
}
