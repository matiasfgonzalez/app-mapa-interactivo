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
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          className="bg-card p-2.5 rounded-lg shadow-md hover:shadow-lg border border-border text-muted-foreground hover:text-foreground transition-all"
          title="Descargar mapa"
        >
          <Download size={18} />
        </button>
        <button
          className="bg-card p-2.5 rounded-lg shadow-md hover:shadow-lg border border-border text-muted-foreground hover:text-foreground transition-all"
          title="Compartir"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Mobile Bottom Panel Toggle */}
      {isMobile && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setMobileBottomPanelOpen(!mobileBottomPanelOpen)}
            className="bg-card p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-border"
          >
            {mobileBottomPanelOpen ? (
              <ChevronDown size={20} className="text-foreground" />
            ) : (
              <ChevronUp size={20} className="text-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Mobile Bottom Panel */}
      {isMobile && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-card border-t border-border transition-transform duration-300 ${
            mobileBottomPanelOpen
              ? "transform translate-y-0"
              : "transform translate-y-full"
          }`}
        >
          <div className="p-4 max-h-60 overflow-y-auto">
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
