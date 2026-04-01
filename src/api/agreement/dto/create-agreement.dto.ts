export class CreateAgreementDto {
    title: string;
    description?: string;
    authorId: number;
    publisherId: number;
    bookId: number;
    documentId?: number;
    blockchainAddress?: string;
    amount: number;
    endDate: string;
    contractData?: any;
}
