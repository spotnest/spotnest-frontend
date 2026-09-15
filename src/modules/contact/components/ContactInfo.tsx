import { Clock, Mail, MapPin, Phone } from "lucide-react";

const channels = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@spotnest.com",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+91 98765 43210",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Tech Park, Kochi, Kerala",
  },
  {
    icon: Clock,
    label: "Support hours",
    value: "Mon – Sat, 9 AM – 6 PM",
  },
];

export default function ContactInfo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {channels.map((channel) => (
        <div
          key={channel.label}
          className="rounded-2xl border border-[#e1e3e4] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d9f4f3] text-[#00696b]">
            <channel.icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#75777e]">
            {channel.label}
          </h3>
          <p className="mt-2 font-medium text-[#191c1d]">{channel.value}</p>
        </div>
      ))}
    </div>
  );
}