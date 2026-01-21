import Receiving from './_components/receiving';

export default function Home() {
  return (
    <div className="px-64 mx-auto py-64 gap-12 flex flex-col items-center">
      <div>보내기</div>
      <Receiving />
    </div>
  );
}
