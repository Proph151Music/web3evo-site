interface HowItWorksCardProps {
  img: string;
  title: string;
  description: string;
}

export default function HowItWorksCard({ img, title, description }: HowItWorksCardProps) {
  return (
    <div className="flex flex-row gap-2 p-4">
      <img src={img} alt="" className="max-w-[25%]" />
      <div className="how-it-works-card-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
