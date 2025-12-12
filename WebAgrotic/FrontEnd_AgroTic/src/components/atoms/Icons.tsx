import type { IconProps } from "../../types/Icon.types";


const Icon = ({ icon: IconComponent, className }: IconProps) => {
return <IconComponent className={className} />;
};

export default Icon;
