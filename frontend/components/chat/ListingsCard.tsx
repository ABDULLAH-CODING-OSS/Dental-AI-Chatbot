import { MapPin, Clock, User, DollarSign, Briefcase } from "lucide-react";

export interface ClinicInfo {
  id: number;
  name: string;
  address: string;
  hours: string;
}

export interface DoctorInfo {
  id: number;
  name: string;
  specialty: string;
  fee: number;
  slots?: string;
}

export interface ServiceInfo {
  id: number;
  name: string;
  price: number;
}

interface ListCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  details: { label: string; value: string | number }[];
  badge?: string;
}

function ListCard({ icon, title, subtitle, details, badge }: ListCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-emerald-600 shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
        {badge && <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md shrink-0">{badge}</span>}
      </div>
      
      <div className="space-y-1.5">
        {details.map((detail, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-slate-600 font-medium">{detail.label}</span>
            <span className="text-slate-900 font-semibold text-right flex-1 ml-2">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClinicCardProps {
  clinic: ClinicInfo;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  return (
    <ListCard
      icon={<MapPin size={18} />}
      title={clinic.name}
      details={[
        { label: "Location", value: clinic.address },
        { label: "Hours", value: clinic.hours },
      ]}
    />
  );
}

interface DoctorCardProps {
  doctor: DoctorInfo;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <ListCard
      icon={<User size={18} />}
      title={doctor.name}
      subtitle={doctor.specialty}
      details={[
        { label: "Consultation Fee", value: `$${doctor.fee.toFixed(2)}` },
        ...(doctor.slots ? [{ label: "Slots", value: doctor.slots }] : []),
      ]}
    />
  );
}

interface ServiceCardProps {
  service: ServiceInfo;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <ListCard
      icon={<Briefcase size={18} />}
      title={service.name}
      details={[{ label: "Price", value: `$${service.price.toFixed(2)}` }]}
    />
  );
}

interface ListingsContainerProps {
  title: string;
  type: "clinics" | "doctors" | "services";
  items: ClinicInfo[] | DoctorInfo[] | ServiceInfo[];
}

export function ListingsContainer({ title, type, items }: ListingsContainerProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-600 text-sm">
        No {type} available at this time.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h3 className="font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          if (type === "clinics") {
            return <ClinicCard key={(item as ClinicInfo).id} clinic={item as ClinicInfo} />;
          } else if (type === "doctors") {
            return <DoctorCard key={(item as DoctorInfo).id} doctor={item as DoctorInfo} />;
          } else {
            return <ServiceCard key={(item as ServiceInfo).id} service={item as ServiceInfo} />;
          }
        })}
      </div>
    </div>
  );
}
