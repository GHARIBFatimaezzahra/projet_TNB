import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { DocumentJointService, DocumentSearchParams } from './document-joint.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AllRoles, AgentFiscalOrAdmin, AdminOnly } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Multer } from 'multer';
import { User } from '../user/entities/user.entity';

@ApiTags('Documents Joints')
@Controller('documents')
@ApiBearerAuth()
export class DocumentJointController {
  constructor(private readonly documentService: DocumentJointService) {}

  @Post()
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Créer un nouveau document' })
  @ApiResponse({ status: 201, description: 'Document créé avec succès' })
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() user: User,
  ) {
    return this.documentService.create(createDocumentDto, user.id);
  }

  @Post('upload')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload d\'un fichier document' })
  @ApiBody({
    description: 'Fichier à uploader',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        parcelleId: {
          type: 'number',
        },
        typeDoc: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('parcelleId') parcelleId: string,
    @Body('typeDoc') typeDoc: string,
    @Body('description') description: string,
    @CurrentUser() user: User,
  ) {
    const filePath = await this.documentService.uploadFile(
      file,
      parseInt(parcelleId),
      typeDoc,
      user.id,
    );

    // Créer l'enregistrement en base
    const createDocumentDto: CreateDocumentDto = {
      parcelleId: parseInt(parcelleId),
      typeDoc: typeDoc as any,
      nomFichier: file.originalname,
      cheminFichier: filePath,
      tailleFichier: file.size,
      mimeType: file.mimetype,
      description,
    };

    return this.documentService.create(createDocumentDto, user.id);
  }

  @Get()
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liste des documents avec filtres' })
  findAll(@Query() searchParams: DocumentSearchParams) {
    return this.documentService.findAll(searchParams);
  }

  @Get('statistics')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Statistiques des documents' })
  getStatistics() {
    return this.documentService.getStatistics();
  }

  @Get('parcelle/:parcelleId')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Documents d\'une parcelle' })
  findByParcelle(@Param('parcelleId', ParseIntPipe) parcelleId: number) {
    return this.documentService.findByParcelle(parcelleId);
  }

  @Get('proprietaire/:proprietaireId')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Documents d\'un propriétaire' })
  findByProprietaire(@Param('proprietaireId', ParseIntPipe) proprietaireId: number) {
    return this.documentService.findByProprietaire(proprietaireId);
  }

  @Get(':id')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Détails d\'un document' })
  @ApiResponse({ status: 200, description: 'Document trouvé' })
  @ApiResponse({ status: 404, description: 'Document introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.findOne(id);
  }

  @Get(':id/download')
  @AllRoles()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Télécharger un document' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const document = await this.documentService.findOne(id);
    
    const file = createReadStream(document.cheminFichier);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.nomFichier}"`,
    });

    return new StreamableFile(file);
  }

  @Patch(':id')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Modifier un document' })
  @ApiResponse({ status: 200, description: 'Document modifié' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Patch(':id/validate')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Valider un document' })
  validateDocument(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.validateDocument(id);
  }

  @Patch(':id/invalidate')
  @AgentFiscalOrAdmin()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Invalider un document' })
  invalidateDocument(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.invalidateDocument(id);
  }

  @Delete(':id')
  @AdminOnly()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiResponse({ status: 200, description: 'Document supprimé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.remove(id);
  }
}