import { StaticImageData } from "next/image";
import { LinkProps } from "next/link";
import React, { HTMLProps } from "react";

// Button and Link Types
export type LinkType = "primary" | "secondary" | "default";
export type ButtonType =
  | "primary"
  | "secondary"
  | "default"
  | "transparent"
  | "white"
  | "black";

// Icon Types
export type IconProps = {
  size?: number;
  width?: number;
  height?: number;
  active?: boolean;
  color?: string;
  color2?: string;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export type IconType = React.FC<IconProps>;

// Link Component Props
export type LinkComponentPropsBase = {
  href: string;
  type?: LinkType;
  showIcon?: boolean;
  Icon?: IconType;
  className?: string;
  label: string;
  activeClassName?: string;
  iconSize?: number;
  iconColor?: string;
} & LinkProps;

type LinkComponentPropsWithActiveClassName = LinkComponentPropsBase & {
  active: boolean;
  activeClassName: string;
  unActiveClassName: string;
};

type LinkComponentPropsWithoutActiveClassName = LinkComponentPropsBase & {
  active?: boolean;
  activeClassName?: string;
  unActiveClassName?: string;
};

export type LinkComponentProps =
  | LinkComponentPropsWithActiveClassName
  | LinkComponentPropsWithoutActiveClassName;

// Page Container Props
export type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  innerContent?: boolean;
  parentClassName?: string;
} & HTMLProps<HTMLDivElement>;

// Button Props
export type ButtonProps = {
  type?: ButtonType;
  buttonType?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
  action?: () => void;
  rounded?: boolean;
  link?: string;
} & HTMLProps<HTMLButtonElement>;

// Select Props
export type SelectProps = {
  value: string;
  onChange: (newValue: string) => void;
  placeholder: string;
  options: string[];
};

// Route Type
export type RouteType = {
  path: string;
  Icon?: IconType;
  showIn?: string[];
  label?: string;
  type?: "link" | "hash";
  activeIn?: string[];
  links?: { [key: string]: RouteType };
};

// NavLink Props
export type NavLinkProps = {
  showIcon?: boolean;
  className?: string;
  linkClassName?: string;
  showActive?: boolean;
  isFooter?: boolean;
};

// WhatWeDoCard Props
export type WhatWeDoCardProps = {
  Icon: IconType;
  title: string;
  description: string;
  image: StaticImageData[] | StaticImageData;
};

// SectionHeader Props
export type SectionHeaderProps = {
  textOne: string;
  textTwo: string;
  activeText?: "text-one" | "text-two";
  className?: string;
};

// Logo Props
export type LogoProps = {
  removeText?: boolean;
  removeImage?: boolean;
  className?: string;
  textClassName?: string;
  height?: number;
  width?: number;
};

// Project Props
export type ProjectProps = {
  title: string;
  description: string;
  id: string;
  image: StaticImageData;
};

// TestimonialCard Props
export type TestimonialCardProps = {
  testimonial: string;
};

// ProjectComponent Props
export type ProjectComponentProps = {
  className?: string;
} & HTMLProps<HTMLDivElement>;

// ProjectCardList Props
export type ProjectCardListProps = {
  inverted?: boolean;
  projects: [ProjectProps, ProjectProps] | [ProjectProps];
} & HTMLProps<HTMLDivElement>;

// About Props
export type AboutProps = {
  removeAds?: boolean;
};

// SocialMedia Props
export type SocialMedia = {
  label: string;
  link: string;
  Icon?: IconType;
  show?: boolean;
};

export type SocialMediaList = SocialMedia[];

// Label Props
export type LabelProps = {
  children: React.ReactNode;
} & HTMLProps<HTMLLabelElement>;

// InputElement Props
export type InputElementProps = {
  label?: React.ReactNode;
  inputClassName?: string;
  inputParentClassName?: string;
  formClassName?: string;
  labelClassName?: string;
  error?: string;
} & HTMLProps<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

// InputField Props
export type InputFieldProps = {
  RightIcon?: IconType;
  buttonTitle?: string;
  imagePreview?: null | string;
  LeftIcon?: IconType;
  rightButtonTitle?: string;
  leftButtonClassName?: string;
  rightButtonClassName?: string;
  leftButtonTitle?: string;
  rightIconAction?: () => void;
  leftIconAction?: () => void;
  iconProps?: IconProps;
} & InputElementProps;

// SelectBox Props
export type SelectOptionType = {
  value: string;
  label: string;
};

export type SelectBoxType = {
  options?: SelectOptionType[];
  emptyOptionLabel?: string;
  hideEmptyOption?: boolean;
} & InputElementProps;
