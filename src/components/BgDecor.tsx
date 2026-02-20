export default function BackgroundDecor({
    src,
    alt,
    extraClass,
}: {
    src: string;
    alt: string;
    extraClass?: string;
}) {
    const isFreelancing = src.toLowerCase().includes("freelancing");
    const sizeClass = isFreelancing ? "h-[12rem]" : "h-[6rem]";

    // Adjust these to match the real star location:
    const STAR_LEFT = "50%";
    const STAR_TOP = "50%";

    return (
        <div className={["absolute animate-float z-[-100]", extraClass].filter(Boolean).join(" ")}>
            {isFreelancing && (
                <img
                    src="/Freelancing-star.webp"
                    alt=""
                    className={`absolute pointer-events-none star-glow ${sizeClass} w-auto select-none block`}
                    style={{
                        left: STAR_LEFT,
                        top: STAR_TOP,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            )}
            <img
                src={src}
                alt={alt}
                className={`${sizeClass} w-auto select-none block`}
                draggable={false}
            />
        </div>
    );
}
