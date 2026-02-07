import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentType, DocumentStatus } from '@prisma/client';

@Controller('documents')
export class DocumentsController {
  constructor(private documents: DocumentsService) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: DocumentType,
    @Query('status') status?: DocumentStatus,
    @Query('region') region?: string,
    @Query('q') q?: string,
  ) {
    return this.documents.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
      status: status ?? DocumentStatus.PUBLISHED,
      region,
      q,
    });
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: { user?: { id: string }; ip?: string; headers?: { 'x-forwarded-for'?: string } },
  ) {
    const doc = await this.documents.findById(id);
    if (!doc) return null;
    const userId = req.user?.id;
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    await this.documents.recordView(id, userId, ip);
    return doc;
  }
}
