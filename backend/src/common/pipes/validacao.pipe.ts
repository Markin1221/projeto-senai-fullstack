import { ValidationPipe } from '@nestjs/common';
export class ValidacaoPipe extends ValidationPipe {
  protected transformPrimitive(value: any) {
    return value;
  }
}
