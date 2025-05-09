'use client';

import React, { useEffect, useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { LogOut } from 'lucide-react';

const NavbarComponent = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded.data);
    } catch (err) {
      console.error('Token tidak valid:', err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, []);

  const handleLogout = async () => {
    document.activeElement?.blur(); // Hapus fokus dari elemen aktif (tombol Logout)
    localStorage.removeItem('token'); // hapus token
    router.push('/login');
  };

  return (
    <Navbar
      color="light"
      light
      expand="md"
      className="px-4 shadow-sm mb-4"
      style={{
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #eaeaea',
      }}
    >
      <NavbarBrand href="/dashboard" style={{ fontWeight: '600', fontSize: '20px' }}>
        PSB RLA IIBS
      </NavbarBrand>
      <Nav className="ms-auto" navbar>
        {user && (
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle
              nav
              caret={false}
              className="p-0"
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <Image
                src={
                  user?.jenis_kelamin === 'Perempuan'
                    ? '/profile-banat.png'
                    : '/profile-banin.png'
                }
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-circle"
                style={{ objectFit: 'cover' }}
              />

            </DropdownToggle>
            <DropdownMenu
                end
                style={{
                    minWidth: '180px',
                    borderRadius: '12px',
                    boxShadow: '0 5px 8px rgba(0,0,0,0.06)',
                    fontSize: '15px'
                }}
            >

              <DropdownItem header>{user?.nama || 'Pengguna'}</DropdownItem>
              <DropdownItem href="/dashboard">Dashboard</DropdownItem>
              <DropdownItem href="/profile">Profil</DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                onClick={handleLogout}
                className="d-flex align-items-center gap-2"
                style={{
                    color: '#e55353', // CoreUI danger color
                    fontWeight: 500,
                    padding: '10px 16px',
                    transition: 'all 0.2s ease',
                }}
                >
                <LogOut size={18} />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        )}
      </Nav>
    </Navbar>
  );
};

export default NavbarComponent;
