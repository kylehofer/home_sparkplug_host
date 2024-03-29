'use strict';
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, 'default', { enumerable: true, value: v });
}) : function(o, v) {
    o['default'] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.decodePayload = exports.encodePayload = void 0;
const ProtoRoot = __importStar(require('./sparkplugPayloadProto'));
const long_1 = __importDefault(require('long'));
const Payload = ProtoRoot.org.eclipse.tahu.protobuf.Payload;
const Template = Payload.Template;
const Parameter = Template.Parameter;
const DataSet = Payload.DataSet;
const DataSetValue = DataSet.DataSetValue;
const Row = DataSet.Row;
const PropertyValue = Payload.PropertyValue;
const PropertySet = Payload.PropertySet;
const PropertySetList = Payload.PropertySetList;
const MetaData = Payload.MetaData;
const Metric = Payload.Metric;
/**
 * Sets the value of an object given it's type expressed as an integer
 *
 * only used during encode functions
 */
function setValue(type, value, object) {
    // TODO not sure about type casts
    switch (type) {
    case 1: // Int8
    case 2: // Int16
    case 3: // Int32
    case 5: // UInt8
    case 6: // UInt16
        object.intValue = value;
        break;
    case 4: // Int64
    case 7: // UInt32
    case 8: // UInt64
    case 13: // DateTime
        object.longValue = value;
        break;
    case 9: // Float
        object.floatValue = value;
        break;
    case 10: // Double
        object.doubleValue = value;
        break;
    case 11: // Boolean
        object.booleanValue = value;
        break;
    case 12: // String
    case 14: // Text
    case 15: // UUID
        object.stringValue = value;
        break;
    case 16: // DataSet
        object.datasetValue = encodeDataSet(value);
        break;
    case 17: // Bytes
    case 18: // File
        object.bytesValue = value;
        break;
    case 19: // Template
        object.templateValue = encodeTemplate(value);
        break;
    case 20: // PropertySet
        object.propertysetValue = encodePropertySet(value);
        break;
    case 21:
        object.propertysetsValue = encodePropertySetList(value);
        break;
    }
}
/** only used during decode functions */
function getValue(type, object) {
    // TODO change type casts
    switch (type) {
    case 1: // Int8
    case 2: // Int16
    case 3: // Int32
        return new Int32Array([object.intValue])[0];
    case 5: // UInt8
    case 6: // UInt16
        return object.intValue;
    case 4: // Int64
        if (object.longValue instanceof long_1.default) {
            return object.longValue.toSigned();
        }
        else {
            return object.longValue;
        }
    case 7: // UInt32
        if (object.longValue instanceof long_1.default) {
            return object.longValue.toInt();
        }
        else {
            return object.longValue;
        }
    case 8: // UInt64
    case 13: // DateTime
        return object.longValue;
    case 9: // Float
        return object.floatValue;
    case 10: // Double
        return object.doubleValue;
    case 11: // Boolean
        return object.booleanValue;
    case 12: // String
    case 14: // Text
    case 15: // UUID
        return object.stringValue;
    case 16: // DataSet
        return decodeDataSet(object.datasetValue);
    case 17: // Bytes
    case 18: // File
        return object.bytesValue;
    case 19: // Template
        return decodeTemplate(object.templateValue);
    case 20: // PropertySet
        return decodePropertySet(object.propertysetValue);
    case 21:
        return decodePropertySetList(object.propertysetsValue);
    default:
        return null;
    }
}
function isSet(value) {
    return value !== null && value !== undefined;
}
function getDataSetValue(type, object) {
    switch (type) {
    case 7: // UInt32
        if (object.longValue instanceof long_1.default)
            return object.longValue.toInt();
        else if (isSet(object.longValue))
            return object.longValue;
    case 4: // UInt64
        if (isSet(object.longValue))
            return object.longValue;
    case 9: // Float
        if (isSet(object.floatValue))
            return object.floatValue;
    case 10: // Double
        if (isSet(object.doubleValue))
            return object.doubleValue;
    case 11: // Boolean
        if (isSet(object.booleanValue))
            return object.booleanValue;
    case 12: // String
        if (isSet(object.stringValue))
            return object.stringValue;
    default:
        throw new Error(`Invalid DataSetValue: ${JSON.stringify(object)}`);
    }
}
function getTemplateParamValue(type, object) {
    switch (type) {
    case 7: // UInt32
        if (object.longValue instanceof long_1.default)
            return object.longValue.toInt();
        else if (isSet(object.longValue))
            return object.longValue;
    case 4: // UInt64
        if (isSet(object.longValue))
            return object.longValue;
    case 9: // Float
        if (isSet(object.floatValue))
            return object.floatValue;
    case 10: // Double
        if (isSet(object.doubleValue))
            return object.doubleValue;
    case 11: // Boolean
        if (isSet(object.booleanValue))
            return object.booleanValue;
    case 12: // String
        if (isSet(object.stringValue))
            return object.stringValue;
    default:
        throw new Error(`Invalid Parameter value: ${JSON.stringify(object)}`);
    }
}
/** transforms a user friendly type and converts it to its corresponding type code */
function encodeType(typeString) {
    switch (typeString.toUpperCase()) {
    case 'INT8':
        return 1;
    case 'INT16':
        return 2;
    case 'INT32':
    case 'INT':
        return 3;
    case 'INT64':
    case 'LONG':
        return 4;
    case 'UINT8':
        return 5;
    case 'UINT16':
        return 6;
    case 'UINT32':
        return 7;
    case 'UINT64':
        return 8;
    case 'FLOAT':
        return 9;
    case 'DOUBLE':
        return 10;
    case 'BOOLEAN':
        return 11;
    case 'STRING':
        return 12;
    case 'DATETIME':
        return 13;
    case 'TEXT':
        return 14;
    case 'UUID':
        return 15;
    case 'DATASET':
        return 16;
    case 'BYTES':
        return 17;
    case 'FILE':
        return 18;
    case 'TEMPLATE':
        return 19;
    case 'PROPERTYSET':
        return 20;
    case 'PROPERTYSETLIST':
        return 21;
    default:
        return 0;
    }
}
/** transforms a type code into a user friendly type */
// @ts-expect-error TODO no consistent return
function decodeType(typeInt) {
    switch (typeInt) {
    case 1:
        return 'Int8';
    case 2:
        return 'Int16';
    case 3:
        return 'Int32';
    case 4:
        return 'Int64';
    case 5:
        return 'UInt8';
    case 6:
        return 'UInt16';
    case 7:
        return 'UInt32';
    case 8:
        return 'UInt64';
    case 9:
        return 'Float';
    case 10:
        return 'Double';
    case 11:
        return 'Boolean';
    case 12:
        return 'String';
    case 13:
        return 'DateTime';
    case 14:
        return 'Text';
    case 15:
        return 'UUID';
    case 16:
        return 'DataSet';
    case 17:
        return 'Bytes';
    case 18:
        return 'File';
    case 19:
        return 'Template';
    case 20:
        return 'PropertySet';
    case 21:
        return 'PropertySetList';
    }
}
function encodeTypes(typeArray) {
    var types = [];
    for (var i = 0; i < typeArray.length; i++) {
        types.push(encodeType(typeArray[i]));
    }
    return types;
}
function decodeTypes(typeArray) {
    var types = [];
    for (var i = 0; i < typeArray.length; i++) {
        types.push(decodeType(typeArray[i]));
    }
    return types;
}
function encodeDataSet(object) {
    const num = object.numOfColumns, names = object.columns, types = encodeTypes(object.types), rows = object.rows, newDataSet = DataSet.create({
            'numOfColumns': num,
            'columns': object.columns,
            'types': types
        }), newRows = [];
    // Loop over all the rows
    for (let i = 0; i < rows.length; i++) {
        const newRow = Row.create(), row = rows[i], elements = [];
        // Loop over all the elements in each row
        // @ts-expect-error TODO check if num is set
        for (let t = 0; t < num; t++) {
            const newValue = DataSetValue.create();
            setValue(types[t], row[t], newValue);
            elements.push(newValue);
        }
        newRow.elements = elements;
        newRows.push(newRow);
    }
    newDataSet.rows = newRows;
    return newDataSet;
}
function decodeDataSet(protoDataSet) {
    const protoTypes = protoDataSet.types; // TODO check exists
    const dataSet = {
        types: decodeTypes(protoTypes),
        rows: [],
    };
    const types = decodeTypes(protoTypes), protoRows = protoDataSet.rows || [], // TODO check exists
        num = protoDataSet.numOfColumns;
    // Loop over all the rows
    for (var i = 0; i < protoRows.length; i++) {
        var protoRow = protoRows[i], protoElements = protoRow.elements || [], // TODO check exists
            rowElements = [];
        // Loop over all the elements in each row
        // @ts-expect-error TODO check exists
        for (var t = 0; t < num; t++) {
            rowElements.push(getDataSetValue(protoTypes[t], protoElements[t]));
        }
        dataSet.rows.push(rowElements);
    }
    dataSet.numOfColumns = num;
    dataSet.types = types;
    dataSet.columns = protoDataSet.columns;
    return dataSet;
}
function encodeMetaData(object) {
    var metadata = MetaData.create(), isMultiPart = object.isMultiPart, contentType = object.contentType, size = object.size, seq = object.seq, fileName = object.fileName, fileType = object.fileType, md5 = object.md5, description = object.description;
    if (isMultiPart !== undefined && isMultiPart !== null) {
        metadata.isMultiPart = isMultiPart;
    }
    if (contentType !== undefined && contentType !== null) {
        metadata.contentType = contentType;
    }
    if (size !== undefined && size !== null) {
        metadata.size = size;
    }
    if (seq !== undefined && seq !== null) {
        metadata.seq = seq;
    }
    if (fileName !== undefined && fileName !== null) {
        metadata.fileName = fileName;
    }
    if (fileType !== undefined && fileType !== null) {
        metadata.fileType = fileType;
    }
    if (md5 !== undefined && md5 !== null) {
        metadata.md5 = md5;
    }
    if (description !== undefined && description !== null) {
        metadata.description = description;
    }
    return metadata;
}
function decodeMetaData(protoMetaData) {
    var metadata = {}, isMultiPart = protoMetaData.isMultiPart, contentType = protoMetaData.contentType, size = protoMetaData.size, seq = protoMetaData.seq, fileName = protoMetaData.fileName, fileType = protoMetaData.fileType, md5 = protoMetaData.md5, description = protoMetaData.description;
    if (isMultiPart !== undefined && isMultiPart !== null) {
        metadata.isMultiPart = isMultiPart;
    }
    if (contentType !== undefined && contentType !== null) {
        metadata.contentType = contentType;
    }
    if (size !== undefined && size !== null) {
        metadata.size = size;
    }
    if (seq !== undefined && seq !== null) {
        metadata.seq = seq;
    }
    if (fileName !== undefined && fileName !== null) {
        metadata.fileName = fileName;
    }
    if (fileType !== undefined && fileType !== null) {
        metadata.fileType = fileType;
    }
    if (md5 !== undefined && md5 !== null) {
        metadata.md5 = md5;
    }
    if (description !== undefined && description !== null) {
        metadata.description = description;
    }
    return metadata;
}
function encodePropertyValue(object) {
    var type = encodeType(object.type), newPropertyValue = PropertyValue.create({
        'type': type
    });
    if (object.value !== undefined && object.value === null) {
        newPropertyValue.isNull = true;
    }
    setValue(type, object.value, newPropertyValue);
    return newPropertyValue;
}
function decodePropertyValue(protoValue) {
    const propertyValue = {
        // @ts-expect-error TODO check exists
        value: getValue(protoValue.type, protoValue),
        type: decodeType(protoValue.type),
    };
    if (protoValue.isNull !== undefined && protoValue.isNull === true) {
        propertyValue.value = null;
    }
    else {
        propertyValue.value = getValue(protoValue.type, protoValue);
    }
    propertyValue.type = decodeType(protoValue.type);
    return propertyValue;
}
function encodePropertySet(object) {
    const keys = [], values = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            keys.push(key);
            values.push(encodePropertyValue(object[key]));
        }
    }
    return PropertySet.create({
        'keys': keys,
        'values': values
    });
}
function decodePropertySet(protoSet) {
    const propertySet = {}, protoKeys = protoSet.keys || [], // TODO check exists
        protoValues = protoSet.values || []; // TODO check exists
    for (var i = 0; i < protoKeys.length; i++) {
        propertySet[protoKeys[i]] = decodePropertyValue(protoValues[i]);
    }
    return propertySet;
}
function encodePropertySetList(object) {
    const propertySets = [];
    for (let i = 0; i < object.length; i++) {
        propertySets.push(encodePropertySet(object[i]));
    }
    return PropertySetList.create({
        'propertyset': propertySets
    });
}
function decodePropertySetList(protoSetList) {
    const propertySets = [], protoSets = protoSetList.propertyset || []; // TODO check exists
    for (let i = 0; i < protoSets.length; i++) {
        propertySets.push(decodePropertySet(protoSets[i]));
    }
    return propertySets;
}
function encodeParameter(object) {
    const type = encodeType(object.type), newParameter = Parameter.create({
        'name': object.name,
        'type': type
    });
    setValue(type, object.value, newParameter);
    return newParameter;
}
function decodeParameter(protoParameter) {
    const protoType = protoParameter.type, parameter = {
        value: getTemplateParamValue(protoType, protoParameter),
        type: decodeType(protoType),
    };
    parameter.name = protoParameter.name;
    parameter.type = decodeType(protoType);
    // @ts-expect-error TODO check exists
    parameter.value = getValue(protoType, protoParameter);
    return parameter;
}
function encodeTemplate(object) {
    let template = Template.create(), metrics = object.metrics, parameters = object.parameters, isDef = object.isDefinition, ref = object.templateRef, version = object.version;
    if (version !== undefined && version !== null) {
        template.version = version;
    }
    if (ref !== undefined && ref !== null) {
        template.templateRef = ref;
    }
    if (isDef !== undefined && isDef !== null) {
        template.isDefinition = isDef;
    }
    // Build up the metric
    if (object.metrics !== undefined && object.metrics !== null) {
        const newMetrics = [];
        metrics = object.metrics;
        // loop over array of metrics
        for (let i = 0; i < metrics.length; i++) {
            newMetrics.push(encodeMetric(metrics[i]));
        }
        template.metrics = newMetrics;
    }
    // Build up the parameters
    if (object.parameters !== undefined && object.parameters !== null) {
        const newParameter = [];
        // loop over array of parameters
        for (let i = 0; i < object.parameters.length; i++) {
            newParameter.push(encodeParameter(object.parameters[i]));
        }
        template.parameters = newParameter;
    }
    return template;
}
function decodeTemplate(protoTemplate) {
    const template = {}, protoMetrics = protoTemplate.metrics, protoParameters = protoTemplate.parameters, isDef = protoTemplate.isDefinition, ref = protoTemplate.templateRef, version = protoTemplate.version;
    if (version !== undefined && version !== null) {
        template.version = version;
    }
    if (ref !== undefined && ref !== null) {
        template.templateRef = ref;
    }
    if (isDef !== undefined && isDef !== null) {
        template.isDefinition = isDef;
    }
    // Build up the metric
    if (protoMetrics !== undefined && protoMetrics !== null) {
        const metrics = [];
        // loop over array of proto metrics, decoding each one
        for (let i = 0; i < protoMetrics.length; i++) {
            metrics.push(decodeMetric(protoMetrics[i]));
        }
        template.metrics = metrics;
    }
    // Build up the parameters
    if (protoParameters !== undefined && protoParameters !== null) {
        const parameter = [];
        // loop over array of parameters
        for (let i = 0; i < protoParameters.length; i++) {
            parameter.push(decodeParameter(protoParameters[i]));
        }
        template.parameters = parameter;
    }
    return template;
}
function encodeMetric(metric) {
    const newMetric = Metric.create({
            name: metric.name
        }), value = metric.value, datatype = encodeType(metric.type), alias = metric.alias, isHistorical = metric.isHistorical, isTransient = metric.isTransient, metadata = metric.metadata, timestamp = metric.timestamp, properties = metric.properties;
    // Get metric type and value
    newMetric.datatype = datatype;
    setValue(datatype, value, newMetric);
    if (timestamp !== undefined && timestamp !== null) {
        newMetric.timestamp = timestamp;
    }
    if (alias !== undefined && alias !== null) {
        newMetric.alias = alias;
    }
    if (isHistorical !== undefined && isHistorical !== null) {
        newMetric.isHistorical = isHistorical;
    }
    if (isTransient !== undefined && isTransient !== null) {
        newMetric.isTransient = isTransient;
    }
    if (value !== undefined && value === null) {
        newMetric.isNull = true;
    }
    if (metadata !== undefined && metadata !== null) {
        newMetric.metadata = encodeMetaData(metadata);
    }
    if (properties !== undefined && properties !== null) {
        newMetric.properties = encodePropertySet(properties);
    }
    return newMetric;
}
function decodeMetric(protoMetric) {
    const metric = {
        // @ts-expect-error TODO check exists
        value: getValue(protoMetric.datatype, protoMetric),
        type: decodeType(protoMetric.datatype)
    };
    if (protoMetric.hasOwnProperty('name')) {
        metric.name = protoMetric.name;
    }
    if (protoMetric.hasOwnProperty('isNull') && protoMetric.isNull === true) {
        metric.value = null;
    }
    else {
        // @ts-expect-error TODO check exists
        metric.value = getValue(protoMetric.datatype, protoMetric);
    }
    if (protoMetric.hasOwnProperty('timestamp')) {
        metric.timestamp = protoMetric.timestamp;
    }
    if (protoMetric.hasOwnProperty('alias')) {
        metric.alias = protoMetric.alias;
    }
    if (protoMetric.hasOwnProperty('isHistorical')) {
        metric.isHistorical = protoMetric.isHistorical;
    }
    if (protoMetric.hasOwnProperty('isTransient')) {
        metric.isTransient = protoMetric.isTransient;
    }
    if (protoMetric.hasOwnProperty('metadata') && protoMetric.metadata) {
        metric.metadata = decodeMetaData(protoMetric.metadata);
    }
    if (protoMetric.hasOwnProperty('properties') && protoMetric.properties) {
        metric.properties = decodePropertySet(protoMetric.properties);
    }
    return metric;
}
function encodePayload(object) {
    var payload = Payload.create({
        'timestamp': object.timestamp
    });
    // Build up the metric
    if (object.metrics !== undefined && object.metrics !== null) {
        var newMetrics = [], metrics = object.metrics;
        // loop over array of metric
        for (var i = 0; i < metrics.length; i++) {
            newMetrics.push(encodeMetric(metrics[i]));
        }
        payload.metrics = newMetrics;
    }
    if (object.seq !== undefined && object.seq !== null) {
        payload.seq = object.seq;
    }
    if (object.uuid !== undefined && object.uuid !== null) {
        payload.uuid = object.uuid;
    }
    if (object.body !== undefined && object.body !== null) {
        payload.body = object.body;
    }
    return Payload.encode(payload).finish();
}
exports.encodePayload = encodePayload;
function decodePayload(proto) {
    var sparkplugPayload = Payload.decode(proto), payload = {};
    if (sparkplugPayload.hasOwnProperty('timestamp')) {
        payload.timestamp = sparkplugPayload.timestamp;
    }
    if (sparkplugPayload.hasOwnProperty('metrics')) {
        const metrics = [];
        for (var i = 0; i < sparkplugPayload.metrics.length; i++) {
            metrics.push(decodeMetric(sparkplugPayload.metrics[i]));
        }
        payload.metrics = metrics;
    }
    if (sparkplugPayload.hasOwnProperty('seq')) {
        payload.seq = sparkplugPayload.seq;
    }
    if (sparkplugPayload.hasOwnProperty('uuid')) {
        payload.uuid = sparkplugPayload.uuid;
    }
    if (sparkplugPayload.hasOwnProperty('body')) {
        payload.body = sparkplugPayload.body;
    }
    return payload;
}
exports.decodePayload = decodePayload;
