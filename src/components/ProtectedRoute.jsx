import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  // Se não estiver logado, manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mas o cargo não for permitido
  if (!allowedRoles.includes(user.cargo)) {
    return <Navigate to="/" replace />;
  }

  // Se passou, renderiza as rotas filhas
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
