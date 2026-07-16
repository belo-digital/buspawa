import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';
import { ParcelDocumentsService } from './parcel-documents.service';
import { Parcel } from './entities/parcel.entity';
import { ManifestParcel } from './entities/manifest-parcel.entity';
import { ParcelScanEvent } from './entities/parcel-scan-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parcel, ManifestParcel, ParcelScanEvent])],
  controllers: [ParcelsController],
  providers: [ParcelsService, ParcelDocumentsService],
  exports: [ParcelsService],
})
export class ParcelsModule {}
