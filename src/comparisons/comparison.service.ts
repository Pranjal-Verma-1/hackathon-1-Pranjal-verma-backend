import { Injectable } from '@nestjs/common';
import { compareRedemption } from './comparison.logic';
import { ComparisonInput, ComparisonResult } from './comparison.types';

@Injectable()
export class ComparisonService {
  compare(input: ComparisonInput): ComparisonResult {
    return compareRedemption(input);
  }
}
