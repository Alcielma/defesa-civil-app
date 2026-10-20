import './UserHeader.css';

export interface UserHeaderProps {
  nome: string;
  avatarInicial?: string;
  prefixo?: string;
}

const UserHeader = ({
  nome,
  avatarInicial,
  prefixo = 'Agen.',
}: UserHeaderProps) => {
  const inicial = avatarInicial ?? nome.charAt(0).toUpperCase();

  return (
    <div className="user-header">
      <div className="user-header__avatar">{inicial}</div>
      <span className="user-header__nome">
        {prefixo} {nome}
      </span>
    </div>
  );
};

export default UserHeader;
