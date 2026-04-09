import ErrorPage from '../../components/ErrorPage';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen">
      <ErrorPage type="not-found" />
    </div>
  );
}
