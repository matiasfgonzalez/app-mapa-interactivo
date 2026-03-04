import { Download, Share2, ChevronDown, ChevronUp } from "lucide-react";

interface MapControlsProps {
  isMobile: boolean;
  mobileBottomPanelOpen: boolean;
  setMobileBottomPanelOpen: (open: boolean) => void;
  lat: number | null;
  lon: number | null;
}

export function MapControls({
  isMobile,
  mobileBottomPanelOpen,
  setMobileBottomPanelOpen,
  lat,
  lon,
}: MapControlsProps) {
  return (
    <>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          className="bg-card/80 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/90 hover:scale-105 transition-all"
          title="Descargar mapa"
        >
          <Download size={18} />
        </button>
        <button
          className="bg-card/80 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/90 hover:scale-105 transition-all"
          title="Compartir"
        >
          <Share2 size={18} />
        </button>
      </div>

      {isMobile && (
        <div className="absolute bottom-6 right-4 z-20">
          <button
            onClick={() => setMobileBottomPanelOpen(!mobileBottomPanelOpen)}
            className="bg-card/90 backdrop-blur-md p-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:scale-105 border border-border/50 text-foreground"
          >
            {mobileBottomPanelOpen ? (
              <ChevronDown size={22} />
            ) : (
              <ChevronUp size={22} />
            )}
          </button>
        </div>
      )}

      {/* Mobile Bottom Panel */}
      {isMobile && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 bg-card/85 backdrop-blur-xl border-t border-border/50 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileBottomPanelOpen
              ? "transform translate-y-0 opacity-100"
              : "transform translate-y-full opacity-50"
          }`}
        >
          <div className="p-6 max-h-[40vh] overflow-y-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="w-12 h-1.5 bg-muted mx-auto rounded-full mb-6 opacity-60"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Coordenadas seleccionadas
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-primary font-mono">
                      {lat?.toFixed(4) || "--"}
                    </div>
                    <div className="text-xs text-primary/70">Latitud</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-primary font-mono">
                      {lon?.toFixed(4) || "--"}
                    </div>
                    <div className="text-xs text-primary/70">Longitud</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
