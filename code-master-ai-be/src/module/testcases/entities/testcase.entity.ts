import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TestCaseDocument = HydratedDocument<TestCase>;

@Schema({ timestamps: true, collection: 'testcases' })
export class TestCase {
  @Prop({ type: Types.ObjectId, ref: 'CodeAssignment', required: true })
  code_assignment_id!: Types.ObjectId;

  @Prop({ required: true })
  input_data!: string;

  @Prop({ required: true })
  expected_output!: string;

  @Prop({ default: false })
  is_hidden?: boolean;
}
export const TestCaseSchema = SchemaFactory.createForClass(TestCase);
