import DataSources from "./data-sources";

export const metadata = {
  title: "Data Sources – ZEUS",
  description:
    "Every dataset powering ZEUS — Ontario GeoHub, MTO registrations, StatCan, OEB, NRCan and more.",
};

export default function DataSourcesPage() {
  return <DataSources />;
}
