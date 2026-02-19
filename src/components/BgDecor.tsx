export default function BackgroundDecor({ src, alt, extraClass }: { src: string; alt: string; extraClass?: string }) {
    return (
        <div
            key={src}
            className={["absolute z-[-100] animate-float", extraClass].join(" ")} >
            <img
                src={src}
                alt={alt}
                className="h-[6rem] w-auto select-none"
            />
            {src.toLowerCase().includes("freelancing") &&
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                        className="center-glow w-24 h-24 rounded-full"
                        style={{
                            background: "radial-gradient(circle, rgba(255,215,0,0.9), rgba(255,215,0,0.0) 70%)",
                        }}
                    />
                </div>
            }
        </div>
    );
}
