/********************************************************************************
 * Copyright (c) 2016-2018 Cirrus Link Solutions and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Cirrus Link Solutions - initial implementation
 ********************************************************************************/
import Long from 'long';
import type * as IProtoRoot from './sparkplugPayloadProto';
import type { Reader } from 'protobufjs';
declare type IPayload = IProtoRoot.org.eclipse.tahu.protobuf.IPayload;
declare type ITemplate = IProtoRoot.org.eclipse.tahu.protobuf.Payload.ITemplate;
declare type IParameter = IProtoRoot.org.eclipse.tahu.protobuf.Payload.Template.IParameter;
declare type IDataSet = IProtoRoot.org.eclipse.tahu.protobuf.Payload.IDataSet;
declare type IPropertyValue = IProtoRoot.org.eclipse.tahu.protobuf.Payload.IPropertyValue;
declare type IMetric = IProtoRoot.org.eclipse.tahu.protobuf.Payload.IMetric;
export declare type TypeStr = 'Int8' | 'Int16' | 'Int32' | 'Int64' | 'UInt8' | 'UInt16' | 'UInt32' | 'UInt64' | 'Float' | 'Double' | 'Boolean' | 'String' | 'DateTime' | 'Text' | 'UUID' | 'DataSet' | 'Bytes' | 'File' | 'Template' | 'PropertySet' | 'PropertySetList';
export interface UMetric extends IMetric {
    value: null | number | Long.Long | boolean | string | Uint8Array | UDataSet | UTemplate;
    type: TypeStr;
    properties?: Record<string, UPropertyValue>;
}
export interface UPropertyValue extends Omit<IPropertyValue, 'type'> {
    value: null | number | Long.Long | boolean | string | UPropertySet | UPropertySetList;
    type: TypeStr;
}
export interface UParameter extends Omit<IParameter, 'type'> {
    value: number | Long.Long | boolean | string | UPropertySet | UPropertySetList;
    type: TypeStr;
}
export interface UTemplate extends Omit<ITemplate, 'metrics' | 'parameters'> {
    metrics?: UMetric[];
    parameters?: UParameter[];
}
export interface UDataSet extends Omit<IDataSet, 'types' | 'rows'> {
    types: TypeStr[];
    rows: UDataSetValue[][];
}
export declare type UDataSetValue = number | Long.Long | boolean | string;
export declare type UPropertySet = Record<string, UPropertyValue>;
export declare type UPropertySetList = UPropertySet[];
export declare type UserValue = UMetric['value'] | UPropertyValue['value'] | UDataSet | UDataSetValue | UPropertySet | UPropertySetList;
export interface UPayload extends IPayload {
    metrics?: UMetric[] | null;
}
export declare function encodePayload(object: UPayload): Uint8Array;
export declare function decodePayload(proto: Uint8Array | Reader): UPayload;
export {};
