import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/States';

export default function NotFound() {
  return <div className="pt-16"><EmptyState title="Page not found" message="That page does not exist or has moved." action={<Link to="/" className="btn btn-primary">Go home</Link>} /></div>;
}
