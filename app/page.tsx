import Receiving from './_components/receiving';
import Sending from './_components/sending';

export default function Home() {
  return (
    <div className="px-4 max-w-3xl mx-auto gap-12 flex flex-col items-center">
      <Sending />
      <Receiving />
    </div>
  );
}
