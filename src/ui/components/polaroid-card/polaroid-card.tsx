"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlaceholder } from "@/ui/components/image-placeholder/image-placeholder";
import styles from "./polaroid-card.module.scss";

export interface PolaroidCardProps {
	imageSrc: string;
	imageAlt: string;
	caption?: string;
	aspectRatio?: "square" | "portrait";
	onImageError?: () => void;
	rotation?: number;
	verticalOffset?: number;
	priority?: boolean;
	className?: string;
}

export function PolaroidCard({
	imageSrc,
	imageAlt,
	caption,
	aspectRatio,
	onImageError,
	rotation = 0,
	verticalOffset = 0,
	priority = false,
	className = "",
}: PolaroidCardProps) {
	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
		onImageError?.();
	};

	const transform = `rotate(${rotation}deg) translateY(${verticalOffset}px)`;

	const imageContainerClass =
		aspectRatio === "square"
			? `${styles.photoImageContainer} ${styles.photoImageContainerSquare}`
			: `${styles.photoImageContainer} ${styles.photoImageContainerPortrait}`;

	const containerClass =
		`${styles.container} ${styles.containerPhoto} ${className}`.trim();

	return (
		<div className={containerClass} style={{ transform }}>
			<div className={styles.frame}>
				<div className={imageContainerClass}>
					{!imageError ? (
						<Image
							src={imageSrc}
							alt={imageAlt}
							fill
							priority={priority}
							className={styles.photoImage}
							sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
							onError={handleImageError}
						/>
					) : (
						<ImagePlaceholder />
					)}
				</div>
				<div className={styles.photoCaptionContainer}>
					{caption && (
						<p className={styles.photoCaption}>{caption}</p>
					)}
				</div>
			</div>
		</div>
	);
}
