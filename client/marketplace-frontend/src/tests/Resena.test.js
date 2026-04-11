import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Reseña from '../componentes/Reseña/Reseña';

jest.mock('lucide-react', () => ({
  Star: () => null,
  User: () => null,
}));

describe('Componente Reseña', () => {
  it('renderiza el nombre del usuario', () => {
    render(<Reseña user="Juan Pérez" rating={5} comment="Excelente producto" date="2024-01-15" />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('renderiza la fecha de la reseña', () => {
    render(<Reseña user="María" rating={4} date="2024-02-20" />);
    expect(screen.getByText('2024-02-20')).toBeInTheDocument();
  });

  it('renderiza el comentario de la reseña', () => {
    render(<Reseña user="Usuario" rating={5} comment="Muy buen servicio" />);
    expect(screen.getByText('"Muy buen servicio"')).toBeInTheDocument();
  });

  it('renderiza valores por defecto cuando no se proporcionan', () => {
    render(<Reseña />);
    expect(screen.getByText('Usuario Nexora')).toBeInTheDocument();
    expect(screen.getByText('Reciente')).toBeInTheDocument();
  });
});