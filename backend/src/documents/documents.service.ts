import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentStatus, DocumentType } from '@prisma/client';

export interface ListDocumentsParams {
  page?: number;
  limit?: number;
  type?: DocumentType;
  status?: DocumentStatus;
  region?: string;
  q?: string;
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: ListDocumentsParams = {}) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const where: Record<string, unknown> = {};
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.region) where.region = params.region;
    if (params.q?.trim()) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { reference: { contains: params.q, mode: 'insensitive' } },
        { summary: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async recordView(documentId: string, userId?: string, ip?: string) {
    await this.prisma.documentView.create({
      data: { documentId, userId, ip },
    });
  }
}
