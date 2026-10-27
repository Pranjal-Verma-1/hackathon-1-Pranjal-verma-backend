import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ComparisonService } from './comparison.service';
import type { ComparisonResult } from './comparison.types';
import { parseComparisonRequest } from './parse-comparison-request';

@Controller('api/comparisons')
export class ComparisonsController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post()
  create(@Body() body: unknown): ComparisonResult {
    const parsed = parseComparisonRequest(body);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.errors);
    }
    return this.comparisonService.compare(parsed.value);
  }
}
