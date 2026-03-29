"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PolaroidCardVariant } from "@/enums/polaroid-card-variant";
import { ImagePlaceholder } from "@/ui/components/image-placeholder/image-placeholder";
import styles from "./polaroid-card.module.scss";

interface BasePolaroidCardProps {
	variant?: PolaroidCardVariant;
	rotation?: number;
	scale?: number;
	offset?: { x: number; y: number };
	verticalOffset?: number;
	priority?: boolean;
	className?: string;
}

interface TripPolaroidCardProps extends BasePolaroidCardProps {
	variant: PolaroidCardVariant.Trip;
	imageSrc: string;
	title: string;
	subtitle: string;
	description?: string;
	href: string;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface PhotoPolaroidCardProps extends BasePolaroidCardProps {
	variant: PolaroidCardVariant.Photo;
	imageSrc: string;
	imageAlt: string;
	caption?: string;
	aspectRatio?: "square" | "portrait";
	onImageError?: () => void;
}

export type PolaroidCardProps = TripPolaroidCardProps | PhotoPolaroidCardProps;

export function PolaroidCard(props: PolaroidCardProps) {
	const {
		variant = PolaroidCardVariant.Trip,
		rotation = 0,
		scale = 1,
		offset = { x: 0, y: 0 },
		verticalOffset = 0,
		priority = false,
		className = "",
	} = props;

	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
		if (props.variant === PolaroidCardVariant.Photo && props.onImageError) {
			props.onImageError();
		}
	};

	const getTransform = () => {
		if (variant === PolaroidCardVariant.Photo) {
			return `rotate(${rotation}deg) translateY(${verticalOffset}px)`;
		}
		return `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`;
	};

	const getPhotoImageContainerClass = (
		aspectRatio?: "square" | "portrait"
	) => {
		if (aspectRatio === "square") {
			return `${styles.photoImageContainer} ${styles.photoImageContainerSquare}`;
		}
		return `${styles.photoImageContainer} ${styles.photoImageContainerPortrait}`;
	};

	const renderPolaroidContent = () => {
		if (variant === PolaroidCardVariant.Trip) {
			const tripProps = props as TripPolaroidCardProps;
			return (
				<>
					<div className={styles.tripImageContainer}>
						{!imageError ? (
							<Image
								src={tripProps.imageSrc}
								alt={tripProps.title}
								fill
								priority={priority}
								className={styles.tripImage}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								onError={handleImageError}
							/>
						) : (
							<ImagePlaceholder />
						)}
					</div>
					<div className={styles.tripContent}>
						<h2 className={styles.tripTitle}>{tripProps.title}</h2>
						<p className={styles.tripSubtitle}>
							{tripProps.subtitle}
						</p>
						{tripProps.description && (
							<p className={styles.tripDescription}>
								{tripProps.description}
							</p>
						)}
					</div>
				</>
			);
		}

		const photoProps = props as PhotoPolaroidCardProps;

		return (
			<>
				<div
					className={getPhotoImageContainerClass(
						photoProps.aspectRatio
					)}
				>
					{!imageError ? (
						<Image
							src={photoProps.imageSrc}
							alt={photoProps.imageAlt}
							fill
							className={styles.photoImage}
							sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
							onError={handleImageError}
						/>
					) : (
						<ImagePlaceholder />
					)}
				</div>
				<div className={styles.photoCaptionContainer}>
					{photoProps.caption && (
						<p className={styles.photoCaption}>
							{photoProps.caption}
						</p>
					)}
				</div>
			</>
		);
	};

	const frameClass =
		variant === PolaroidCardVariant.Trip
			? `${styles.frame} ${styles.frameTrip}`
			: styles.frame;

	const polaroidFrame = (
		<div className={frameClass}>{renderPolaroidContent()}</div>
	);

	if (variant === PolaroidCardVariant.Trip) {
		const tripProps = props as TripPolaroidCardProps;
		const linkClass =
			`${styles.container} ${styles.tripLink} ${className}`.trim();
		return (
			<Link
				href={tripProps.href}
				className={linkClass}
				style={{ transform: getTransform() }}
				onClick={tripProps.onClick}
			>
				{polaroidFrame}
			</Link>
		);
	}

	const containerClass =
		`${styles.container} ${styles.containerPhoto} ${className}`.trim();
	return (
		<div className={containerClass} style={{ transform: getTransform() }}>
			{polaroidFrame}
		</div>
	);
}
