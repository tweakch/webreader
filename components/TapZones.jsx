/**
 * Left and right tap zones for page navigation.
 * Two invisible 30%-width divs on the sides that call prev/next on click.
 * Only rendered when tap-zones flag is on.
 *
 * onPrev - called when left zone is tapped
 * onNext - called when right zone is tapped
 */
export default function TapZones({ onPrev, onClick, onNext }) {
  return (
    <>
      {/* Left tap zone - previous page */}
      <div
        data-testid="tap-zone-left"
        className="absolute left-0 top-0 bottom-0 z-10 cursor-pointer"
        style={{ width: '30%' }}
        onClick={onPrev}
      />

      {/* Middle: 40% */}
      <div 
        data-testid="tap-zone-middle" 
        className="absolute left-[30%] right-[30%] top-0 bottom-0 z-10 cursor-pointer" 
        onClick={onClick} 
      />
      
      {/* Right tap zone - next page */}
      <div
        data-testid="tap-zone-right"
        className="absolute right-0 top-0 bottom-0 z-10 cursor-pointer"
        style={{ width: '30%' }}
        onClick={onNext}
      />
    </>
  );
}
