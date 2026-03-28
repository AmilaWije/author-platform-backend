export class CreateAgreementDto {
    title: string;
    description?: string;
    authorId: number;
    publisherId: number;
    bookId: number;
    documentId?: number;
    contractData?: any;
}
