import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ParcelsService } from './parcels.service';
import { ParcelDocumentsService } from './parcel-documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parcels')
@UseGuards(JwtAuthGuard)
export class ParcelsController {
  constructor(
    private parcelsService: ParcelsService,
    private documentsService: ParcelDocumentsService,
  ) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.parcelsService.create({ ...body, createdById: req.user.sub });
  }

  @Get()
  findAll(@Query() query: { status?: string; origin?: string; destination?: string }) {
    return this.parcelsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.parcelsService.getStats();
  }

  @Get(':trackingCode')
  findByTracking(@Param('trackingCode') trackingCode: string) {
    return this.parcelsService.findByTracking(trackingCode);
  }

  @Get(':trackingCode/scan-history')
  getScanHistory(@Param('trackingCode') trackingCode: string) {
    return this.parcelsService.getScanHistory(trackingCode);
  }

  @Get(':trackingCode/receipt')
  @Header('Content-Type', 'application/pdf')
  async getReceipt(@Param('trackingCode') trackingCode: string, @Res() res: Response) {
    const parcel = await this.parcelsService.findByTracking(trackingCode);
    const receipt = await this.documentsService.generateReceipt({
      trackingCode: parcel.trackingCode,
      senderName: parcel.senderName,
      senderPhone: parcel.senderPhone || '',
      receiverName: parcel.receiverName,
      receiverPhone: parcel.receiverPhone || '',
      origin: parcel.origin,
      destination: parcel.destination,
      description: parcel.description,
      weight: Number(parcel.actualWeight),
      fare: Number(parcel.fare),
      paymentMethod: parcel.paymentMethod,
      serviceLevel: parcel.serviceLevel,
      createdAt: parcel.createdAt,
    });
    res.set({
      'Content-Disposition': `attachment; filename="receipt-${trackingCode}.pdf"`,
    });
    res.send(receipt);
  }

  @Get(':trackingCode/sticker')
  @Header('Content-Type', 'application/pdf')
  async getSticker(@Param('trackingCode') trackingCode: string, @Res() res: Response) {
    const parcel = await this.parcelsService.findByTracking(trackingCode);
    const qrCodeDataUrl = await this.documentsService.generateQRCode(parcel.qrCodeData || parcel.trackingCode);
    const sticker = await this.documentsService.generateSticker({
      trackingCode: parcel.trackingCode,
      origin: parcel.origin,
      destination: parcel.destination,
      senderName: parcel.senderName,
      receiverName: parcel.receiverName,
      description: parcel.description,
      weight: Number(parcel.actualWeight),
      qrCodeDataUrl,
    });
    res.set({
      'Content-Disposition': `attachment; filename="sticker-${trackingCode}.pdf"`,
    });
    res.send(sticker);
  }

  @Patch(':trackingCode/assign')
  assignToTrip(@Param('trackingCode') trackingCode: string, @Body() body: { tripId: string; vehicleReg: string }) {
    return this.parcelsService.assignToTrip(trackingCode, body.tripId, body.vehicleReg);
  }

  @Post(':trackingCode/scan')
  scanParcel(
    @Param('trackingCode') trackingCode: string,
    @Body() body: { scanType: 'loaded' | 'received' | 'collected'; location?: string; vehicleReg?: string; notes?: string; receiverSignatureUrl?: string },
    @Request() req: any,
  ) {
    return this.parcelsService.scanParcel(trackingCode, body.scanType, {
      scannedByUserId: req.user.sub,
      scannedByName: req.user.email,
      location: body.location,
      vehicleReg: body.vehicleReg,
      notes: body.notes,
      receiverSignatureUrl: body.receiverSignatureUrl,
    });
  }
}
