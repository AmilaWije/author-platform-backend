export class CreateUserDto {
    f_name: string;
    l_name: string;
    username: string;
    password: string;
    email: string;
    country: string;
    role?: 'Author' | 'Buyer' | 'Publisher';
    walletId: string;
    createdAt: string;
    updatedAt: string;
}
