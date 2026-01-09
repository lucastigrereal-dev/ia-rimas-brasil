/**
 * @fileoverview Tests for Loading components
 * @module components/__tests__/Loading.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Spinner,
  FullPageLoader,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonDrillCard,
  SkeletonStatCard,
  SkeletonLeaderboardRow,
  SkeletonList,
  SkeletonGrid,
  SkeletonProfile,
  SkeletonHome,
} from '../Loading';

describe('Spinner', () => {
  it('renders with default size', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8', 'h-8'); // md size
  });

  it('renders with small size', () => {
    render(<Spinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('renders with xl size', () => {
    render(<Spinner size="xl" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-16', 'h-16');
  });

  it('applies custom className to container', () => {
    const { container } = render(<Spinner className="custom-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('has accessible label', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Carregando');
  });
});

describe('FullPageLoader', () => {
  it('renders with default message', () => {
    render(<FullPageLoader />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<FullPageLoader message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders spinner element', () => {
    render(<FullPageLoader />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders base skeleton', () => {
    render(<Skeleton className="w-full h-4" />);
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders SkeletonText with default lines', () => {
    render(<SkeletonText />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(1); // default 1 line
  });

  it('renders SkeletonText with custom lines', () => {
    render(<SkeletonText lines={5} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('renders SkeletonAvatar with default size', () => {
    render(<SkeletonAvatar />);
    const avatar = document.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('renders SkeletonAvatar with custom size', () => {
    render(<SkeletonAvatar size={64} />);
    const avatar = document.querySelector('.rounded-full');
    expect(avatar).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('renders SkeletonButton', () => {
    render(<SkeletonButton />);
    const button = document.querySelector('.rounded-xl');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ height: '40px' }); // default height
  });
});

describe('Skeleton Cards', () => {
  it('renders SkeletonDrillCard', () => {
    render(<SkeletonDrillCard />);
    const card = document.querySelector('.rounded-xl');
    expect(card).toBeInTheDocument();
  });

  it('renders SkeletonStatCard', () => {
    render(<SkeletonStatCard />);
    const card = document.querySelector('.rounded-xl');
    expect(card).toBeInTheDocument();
  });

  it('renders SkeletonLeaderboardRow', () => {
    render(<SkeletonLeaderboardRow />);
    const row = document.querySelector('.flex.items-center');
    expect(row).toBeInTheDocument();
  });
});

describe('SkeletonList', () => {
  it('renders default number of items', () => {
    render(<SkeletonList />);
    const items = document.querySelectorAll('.flex.items-center');
    expect(items.length).toBe(3); // default count is 3
  });

  it('renders custom number of items', () => {
    render(<SkeletonList count={5} />);
    const items = document.querySelectorAll('.flex.items-center');
    expect(items.length).toBe(5);
  });
});

describe('SkeletonGrid', () => {
  it('renders grid of skeleton cards', () => {
    render(<SkeletonGrid count={4} />);
    const cards = document.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(4);
  });

  it('has grid layout', () => {
    const { container } = render(<SkeletonGrid count={2} />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
  });
});

describe('SkeletonProfile', () => {
  it('renders profile skeleton elements', () => {
    render(<SkeletonProfile />);
    // Should have multiple skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    // Should have an avatar (rounded-full)
    const avatar = document.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
  });
});

describe('SkeletonHome', () => {
  it('renders home skeleton elements', () => {
    render(<SkeletonHome />);
    // Should render multiple skeleton sections
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
